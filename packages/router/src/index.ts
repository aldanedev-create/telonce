/**
 * @teloce/router - A small client-side router for Teloce SPAs
 * 
 * Features:
 * - Hash-based routing (no server config needed)
 * - Dynamic route parameters (:id, :username)
 * - Query parameter parsing
 * - Route guards (beforeEach, afterEach)
 * - History navigation (push, replace, back, forward)
 * - Lazy loading support
 * - Nested routes
 * - Installable as Teloce plugin
 */

import { createSignal, createEffect, type Signal } from '@teloce/reactivity';

// ─── Types ──────────────────────────────────────────────────────────

export interface Route {
  path: string;
  component: RouteComponent;
  children?: Route[];
  meta?: Record<string, any>;
}

export interface RouteComponent {
  template: (container: Element, ctx: RouteContext) => void;
  name?: string;
}

export interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
  meta?: Record<string, any>;
}

export interface Router {
  path: Signal<string>;
  params: Signal<Record<string, string>>;
  query: Signal<Record<string, string>>;
  currentRoute: Signal<RouteContext | null>;
  navigate: (to: string | LocationDescriptor) => void;
  push: (to: string | LocationDescriptor) => void;
  replace: (to: string | LocationDescriptor) => void;
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
  mount: (container: Element, ctx?: Record<string, any>) => void;
  beforeEach: (guard: NavigationGuard) => void;
  afterEach: (hook: NavigationHook) => void;
  install: (app: any) => void;
}

export interface LocationDescriptor {
  path: string;
  query?: Record<string, string>;
  replace?: boolean;
}

export type NavigationGuard = (
  to: RouteContext,
  from: RouteContext | null
) => boolean | string | void | Promise<boolean | string | void>;

export type NavigationHook = (
  to: RouteContext,
  from: RouteContext | null
) => void;

export interface MatchedRoute {
  route: Route;
  params: Record<string, string>;
  children: MatchedRoute[];
}

// ─── Helpers ────────────────────────────────────────────────────────

function parseQuery(queryString: string): Record<string, string> {
  if (!queryString || queryString === '?') return {};
  
  const params: Record<string, string> = {};
  const search = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  
  for (const pair of search.split('&')) {
    if (!pair) continue;
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
  }
  
  return params;
}

function stringifyQuery(query: Record<string, string>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

function buildRouteContext(
  path: string,
  params: Record<string, string>,
  query: Record<string, string>,
  meta?: Record<string, any>
): RouteContext {
  return { path, params, query, meta };
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function getPathFromHash(): string {
  const hash = location.hash.slice(1);
  const queryIndex = hash.indexOf('?');
  return queryIndex !== -1 ? hash.slice(0, queryIndex) : hash || '/';
}

function getQueryFromHash(): Record<string, string> {
  const hash = location.hash.slice(1);
  const queryIndex = hash.indexOf('?');
  return queryIndex !== -1 ? parseQuery(hash.slice(queryIndex)) : {};
}

function getFullHash(): string {
  return location.hash.slice(1) || '/';
}

// ─── Route Matching ────────────────────────────────────────────────

function matchRoute(pattern: string, actual: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const actualParts = actual.split('/').filter(Boolean);
  
  if (patternParts.length !== actualParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(actualParts[i]);
    } else if (p !== actualParts[i]) {
      return null;
    }
  }
  return params;
}

function findMatchedRoute(
  routes: Route[],
  path: string,
  parentParams: Record<string, string> = {}
): MatchedRoute | null {
  const pathParts = path.split('/').filter(Boolean);
  
  for (const route of routes) {
    const params = matchRoute(route.path, path);
    if (params) {
      const allParams = { ...parentParams, ...params };
      
      // Check for children
      let children: MatchedRoute[] = [];
      if (route.children) {
        // Find matching child route (for nested routes)
        const childPath = pathParts.slice(route.path.split('/').filter(Boolean).length).join('/');
        const childMatch = findMatchedRoute(route.children, `/${childPath}`, allParams);
        if (childMatch) {
          children = [childMatch];
        }
      }
      
      return {
        route,
        params: allParams,
        children
      };
    }
  }
  
  return null;
}

function flattenRoutes(routes: Route[], prefix: string = ''): Route[] {
  const result: Route[] = [];
  
  for (const route of routes) {
    const fullPath = prefix ? `${prefix}${route.path}` : route.path;
    result.push({ ...route, path: fullPath });
    
    if (route.children) {
      result.push(...flattenRoutes(route.children, fullPath));
    }
  }
  
  return result;
}

// ─── History ────────────────────────────────────────────────────────

interface HistoryEntry {
  path: string;
  query: Record<string, string>;
}

class HistoryManager {
  private stack: HistoryEntry[] = [];
  private index: number = -1;
  
  constructor(initialPath: string, initialQuery: Record<string, string>) {
    this.stack.push({ path: initialPath, query: initialQuery });
    this.index = 0;
  }
  
  push(path: string, query: Record<string, string>): void {
    // Remove forward history
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push({ path, query });
    this.index = this.stack.length - 1;
    this.updateHash(path, query);
  }
  
  replace(path: string, query: Record<string, string>): void {
    this.stack[this.index] = { path, query };
    this.updateHash(path, query);
  }
  
  back(): boolean {
    if (this.index > 0) {
      this.index--;
      const entry = this.stack[this.index];
      this.updateHash(entry.path, entry.query);
      return true;
    }
    return false;
  }
  
  forward(): boolean {
    if (this.index < this.stack.length - 1) {
      this.index++;
      const entry = this.stack[this.index];
      this.updateHash(entry.path, entry.query);
      return true;
    }
    return false;
  }
  
  go(delta: number): boolean {
    const newIndex = this.index + delta;
    if (newIndex >= 0 && newIndex < this.stack.length) {
      this.index = newIndex;
      const entry = this.stack[this.index];
      this.updateHash(entry.path, entry.query);
      return true;
    }
    return false;
  }
  
  get current(): HistoryEntry {
    return this.stack[this.index];
  }
  
  private updateHash(path: string, query: Record<string, string>): void {
    const queryString = stringifyQuery(query);
    location.hash = queryString ? `${path}${queryString}` : path;
  }
  
  get length(): number {
    return this.stack.length;
  }
}

// ─── Router Implementation ────────────────────────────────────────

export function createRouter(routes: Route[]): Router {
  // Flatten routes for matching
  const flatRoutes = flattenRoutes(routes);
  
  // Reactive state
  const path = createSignal(getPathFromHash());
  const params = createSignal<Record<string, string>>({});
  const query = createSignal<Record<string, string>>(getQueryFromHash());
  const currentRoute = createSignal<RouteContext | null>(null);
  
  // Guards and hooks
  const beforeEachGuards: NavigationGuard[] = [];
  const afterEachHooks: NavigationHook[] = [];
  let isNavigating = false;
  let pendingNavigation: (() => void) | null = null;
  
  // History
  const history = new HistoryManager(getPathFromHash(), getQueryFromHash());
  
  // ─── Navigation ──────────────────────────────────────────────────
  
  function performNavigation(
    toPath: string,
    toQuery: Record<string, string>,
    replace: boolean = false
  ): void {
    const from = currentRoute();
    const matched = findMatchedRoute(flatRoutes, toPath);
    
    if (!matched) {
      console.warn(`[Teloce Router] No route found for: ${toPath}`);
      // Show 404 or fallback
      return;
    }
    
    const to: RouteContext = buildRouteContext(
      toPath,
      matched.params,
      toQuery,
      matched.route.meta
    );
    
    // Run guards
    runGuards(to, from, () => {
      // Update state
      path.set(toPath);
      params.set(to.params);
      query.set(toQuery);
      currentRoute.set(to);
      
      // Update history
      if (replace) {
        history.replace(toPath, toQuery);
      } else {
        history.push(toPath, toQuery);
      }
      
      // Run after hooks
      runAfterHooks(to, from);
    });
  }
  
  function runGuards(
    to: RouteContext,
    from: RouteContext | null,
    next: () => void
  ): void {
    if (isNavigating) {
      pendingNavigation = next;
      return;
    }
    
    isNavigating = true;
    let index = 0;
    
    function runNextGuard(): void {
      if (index >= beforeEachGuards.length) {
        isNavigating = false;
        if (pendingNavigation) {
          const pending = pendingNavigation;
          pendingNavigation = null;
          pending();
        }
        next();
        return;
      }
      
      const guard = beforeEachGuards[index++];
      const result = guard(to, from);
      
      if (result === false) {
        // Navigation cancelled
        isNavigating = false;
        pendingNavigation = null;
        return;
      }
      
      if (typeof result === 'string') {
        // Redirect
        isNavigating = false;
        pendingNavigation = null;
        navigate(result);
        return;
      }
      
      runNextGuard();
    }
    
    runNextGuard();
  }
  
  function runAfterHooks(to: RouteContext, from: RouteContext | null): void {
    for (const hook of afterEachHooks) {
      hook(to, from);
    }
  }
  
  // ─── Navigate ────────────────────────────────────────────────────
  
  function navigate(to: string | LocationDescriptor): void {
    if (typeof to === 'string') {
      const queryIndex = to.indexOf('?');
      const path = queryIndex !== -1 ? to.slice(0, queryIndex) : to;
      const query = queryIndex !== -1 ? parseQuery(to.slice(queryIndex)) : {};
      performNavigation(normalizePath(path), query);
    } else {
      const path = normalizePath(to.path);
      const query = to.query || {};
      performNavigation(path, query, to.replace || false);
    }
  }
  
  function push(to: string | LocationDescriptor): void {
    navigate(to);
  }
  
  function replace(to: string | LocationDescriptor): void {
    if (typeof to === 'string') {
      const queryIndex = to.indexOf('?');
      const path = queryIndex !== -1 ? to.slice(0, queryIndex) : to;
      const query = queryIndex !== -1 ? parseQuery(to.slice(queryIndex)) : {};
      performNavigation(normalizePath(path), query, true);
    } else {
      const path = normalizePath(to.path);
      const query = to.query || {};
      performNavigation(path, query, true);
    }
  }
  
  function back(): void {
    if (history.back()) {
      const entry = history.current;
      path.set(entry.path);
      query.set(entry.query);
      
      const matched = findMatchedRoute(flatRoutes, entry.path);
      if (matched) {
        params.set(matched.params);
        currentRoute.set(buildRouteContext(entry.path, matched.params, entry.query));
      }
    }
  }
  
  function forward(): void {
    if (history.forward()) {
      const entry = history.current;
      path.set(entry.path);
      query.set(entry.query);
      
      const matched = findMatchedRoute(flatRoutes, entry.path);
      if (matched) {
        params.set(matched.params);
        currentRoute.set(buildRouteContext(entry.path, matched.params, entry.query));
      }
    }
  }
  
  function go(delta: number): void {
    if (history.go(delta)) {
      const entry = history.current;
      path.set(entry.path);
      query.set(entry.query);
      
      const matched = findMatchedRoute(flatRoutes, entry.path);
      if (matched) {
        params.set(matched.params);
        currentRoute.set(buildRouteContext(entry.path, matched.params, entry.query));
      }
    }
  }
  
  // ─── Hash Change Listener ───────────────────────────────────────
  
  window.addEventListener('hashchange', () => {
    const newPath = getPathFromHash();
    const newQuery = getQueryFromHash();
    
    if (newPath !== path() || JSON.stringify(newQuery) !== JSON.stringify(query())) {
      // Handle browser back/forward
      const matched = findMatchedRoute(flatRoutes, newPath);
      if (matched) {
        path.set(newPath);
        query.set(newQuery);
        params.set(matched.params);
        currentRoute.set(buildRouteContext(newPath, matched.params, newQuery));
      }
    }
  });
  
  // ─── Mount ──────────────────────────────────────────────────────
  
  function mount(container: Element, ctx: Record<string, any> = {}): void {
    createEffect(() => {
      const current = path();
      const q = query();
      const matched = findMatchedRoute(flatRoutes, current);
      
      // Update params
      if (matched) {
        params.set(matched.params);
        const routeContext = buildRouteContext(current, matched.params, q, matched.route.meta);
        currentRoute.set(routeContext);
      }
      
      container.innerHTML = '';
      
      if (matched) {
        const fullCtx = {
          ...ctx,
          params: matched.params,
          query: q,
          path: current,
          meta: matched.route.meta,
        };
        
        matched.route.component.template(container, fullCtx);
        
        // Handle nested routes if present
        if (matched.children.length > 0) {
          // Find or create child container
          let childContainer = container.querySelector('[data-router-view]');
          if (!childContainer) {
            childContainer = document.createElement('div');
            childContainer.setAttribute('data-router-view', '');
            container.appendChild(childContainer);
          }
          
          // Render nested route
          const child = matched.children[0];
          const childCtx = {
            ...fullCtx,
            params: { ...fullCtx.params, ...child.params },
          };
          child.route.component.template(childContainer as Element, childCtx);
        }
      } else {
        // No route found - render 404
        container.innerHTML = '<h1>404 - Page Not Found</h1>';
      }
    });
  }
  
  // ─── Guards and Hooks ───────────────────────────────────────────
  
  function beforeEach(guard: NavigationGuard): void {
    beforeEachGuards.push(guard);
  }
  
  function afterEach(hook: NavigationHook): void {
    afterEachHooks.push(hook);
  }
  
  // ─── Install Plugin ─────────────────────────────────────────────
  
  function install(app: any): void {
    // Register router as a component
    if (app.component) {
      app.component('RouterView', {
        template: (container: Element, ctx: any) => {
          const current = path();
          const matched = findMatchedRoute(flatRoutes, current);
          
          container.innerHTML = '';
          if (matched) {
            const fullCtx = {
              ...ctx,
              params: matched.params,
              query: query(),
              path: current,
            };
            matched.route.component.template(container, fullCtx);
          }
        },
      });
    }
    
    // Add router to app context
    if (app._context) {
      app._context.router = this;
    }
    
    // Provide router to components
    if (app.provide) {
      app.provide('router', this);
      app.provide('route', currentRoute);
    }
  }
  
  // ─── Router API ──────────────────────────────────────────────────
  
  const router: Router = {
    path,
    params,
    query,
    currentRoute,
    navigate,
    push,
    replace,
    back,
    forward,
    go,
    mount,
    beforeEach,
    afterEach,
    install,
  };
  
  // Initial navigation
  const initialPath = getPathFromHash();
  const initialQuery = getQueryFromHash();
  const initialMatched = findMatchedRoute(flatRoutes, initialPath);
  if (initialMatched) {
    params.set(initialMatched.params);
    currentRoute.set(buildRouteContext(initialPath, initialMatched.params, initialQuery));
  }
  
  return router;
}

// ─── Router View Component ────────────────────────────────────────

export function createRouterView(): {
  template: (container: Element, ctx: any) => void;
} {
  return {
    template: (container: Element, ctx: any) => {
      const router = ctx.router || ctx.$router;
      if (!router) {
        container.innerHTML = '<p>Router not found</p>';
        return;
      }
      
      const current = router.path();
      const matched = findMatchedRoute(
        // We need access to routes - store them on router
        (router as any)._routes || [],
        current
      );
      
      container.innerHTML = '';
      if (matched) {
        const fullCtx = {
          ...ctx,
          params: matched.params,
          query: router.query(),
          path: current,
        };
        matched.route.component.template(container, fullCtx);
      }
    },
  };
}

// ─── Link Component ───────────────────────────────────────────────

export function createRouterLink(props: {
  to: string | LocationDescriptor;
  activeClass?: string;
  exactActiveClass?: string;
}) {
  return {
    template: (container: Element, ctx: any) => {
      const router = ctx.router || ctx.$router;
      if (!router) {
        container.innerHTML = '<a>Router not found</a>';
        return;
      }
      
      const to = typeof props.to === 'string' ? props.to : props.to.path;
      const current = router.path();
      const isActive = current === to;
      const isExactActive = current === to;
      
      const a = document.createElement('a');
      a.href = `#${to}`;
      a.textContent = container.textContent || 'Link';
      
      if (isActive && props.activeClass) {
        a.className = props.activeClass;
      }
      if (isExactActive && props.exactActiveClass) {
        a.className = props.exactActiveClass;
      }
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(props.to);
      });
      
      container.innerHTML = '';
      container.appendChild(a);
    },
  };
}

// ─── Default Export ──────────────────────────────────────────────

export default {
  createRouter,
  createRouterView,
  createRouterLink,
};