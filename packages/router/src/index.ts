/**
 * @teloce/router - A robust client-side router for Teloce SPAs
 */

import { createSignal, createEffect, type Signal } from '@teloce/reactivity';

/**
 * createEffect() returns a real Effect object ({run, stop}), not a plain
 * callable disposer function - `activeEffectDisposer = createEffect(...)`
 * followed later by `activeEffectDisposer()` would throw
 * `TypeError: activeEffectDisposer is not a function` the moment anyone
 * actually tried to unmount, since you can't call an object. This adapts
 * a real Effect into the `() => void` shape the rest of this file expects.
 */
function wrapEffectAsDisposer(effect: { stop: () => void }): () => void {
  return () => effect.stop();
}

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
  query: Record<string, string | string[]>;
  path: string;
  fullPath: string;
  meta: Record<string, any>;
  matched: Route[];
}

export interface LocationDescriptor {
  path: string;
  query?: Record<string, string | string[]>;
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

export interface MatchedBranchRecord {
  route: Route;
  pattern: string;
  params: Record<string, string>;
}

export interface RouterLinkProps {
  to: string | LocationDescriptor;
  activeClass?: string;
  exactActiveClass?: string;
  label?: string;
}

export interface Router {
  path: Signal<string>;
  params: Signal<Record<string, string>>;
  query: Signal<Record<string, string | string[]>>;
  currentRoute: Signal<RouteContext | null>;
  navigate: (to: string | LocationDescriptor) => Promise<boolean>;
  push: (to: string | LocationDescriptor) => Promise<boolean>;
  replace: (to: string | LocationDescriptor) => Promise<boolean>;
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
  mount: (container: Element, ctx?: Record<string, any>) => () => void;
  beforeEach: (guard: NavigationGuard) => void;
  afterEach: (hook: NavigationHook) => void;
  install: (app: any) => void;
  getMatchedBranch: () => MatchedBranchRecord[];
  routes: Route[];
}

export function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export function parseQuery(queryString: string): Record<string, string | string[]> {
  if (!queryString || queryString === '?') return {};

  const query: Record<string, string | string[]> = {};
  const search = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  for (const pair of search.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    let rawKey: string, rawVal: string;

    if (eqIdx === -1) {
      rawKey = pair;
      rawVal = '';
    } else {
      rawKey = pair.slice(0, eqIdx);
      rawVal = pair.slice(eqIdx + 1);
    }

    const key = safeDecodeURIComponent(rawKey);
    const value = safeDecodeURIComponent(rawVal);

    if (key in query) {
      const existing = query[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        query[key] = [existing, value];
      }
    } else {
      query[key] = value;
    }
  }

  return query;
}

export function stringifyQuery(query: Record<string, string | string[]>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      for (const subVal of val) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(subVal)}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.replace(/\/+/g, '/');
  if (clean === '/') return '/';
  return clean.startsWith('/') ? clean.replace(/\/$/, '') : `/${clean.replace(/\/$/, '')}`;
}

export function parseHashUrl(hashUrl: string): { path: string; query: Record<string, string | string[]> } {
  const hash = hashUrl.startsWith('#') ? hashUrl.slice(1) : hashUrl;
  const raw = hash || '/';
  const qIdx = raw.indexOf('?');

  if (qIdx === -1) {
    return { path: normalizePath(raw), query: {} };
  }

  return {
    path: normalizePath(raw.slice(0, qIdx)),
    query: parseQuery(raw.slice(qIdx))
  };
}

function cleanPathSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, '');
}

function matchSegmentPattern(
  pattern: string,
  pathname: string,
  isLeaf: boolean
): { params: Record<string, string>; matchedLength: number } | null {
  const normPattern = normalizePath(pattern);
  const patternSegs = normPattern.split('/').filter(Boolean);
  const pathSegs = pathname.split('/').filter(Boolean);

  if (pattern === '*' || pattern === '(.*)') {
    return {
      params: { pathMatch: pathSegs.join('/') },
      matchedLength: pathSegs.length
    };
  }

  const params: Record<string, string> = {};
  let pIdx = 0;
  let uIdx = 0;

  while (pIdx < patternSegs.length) {
    const pSeg = patternSegs[pIdx];

    if (pSeg === '*') {
      const rest = pathSegs.slice(uIdx).map(safeDecodeURIComponent).join('/');
      params['pathMatch'] = rest;
      return { params, matchedLength: pathSegs.length };
    }

    const isOptional = pSeg.endsWith('?');
    const rawParam = isOptional ? pSeg.slice(0, -1) : pSeg;

    if (rawParam.startsWith(':')) {
      const paramName = rawParam.slice(1);
      if (uIdx < pathSegs.length) {
        params[paramName] = safeDecodeURIComponent(pathSegs[uIdx]);
        uIdx++;
      } else if (!isOptional) {
        return null;
      }
    } else {
      if (uIdx >= pathSegs.length || pSeg !== pathSegs[uIdx]) {
        return null;
      }
      uIdx++;
    }
    pIdx++;
  }

  if (isLeaf && uIdx !== pathSegs.length) {
    return null;
  }

  return { params, matchedLength: uIdx };
}

function matchRouteTree(
  routes: Route[],
  targetPath: string,
  parentPrefix: string = ''
): MatchedBranchRecord[] | null {
  const normalizedTarget = normalizePath(targetPath);

  for (const route of routes) {
    const routeSegment = cleanPathSegment(route.path);
    const fullPattern = parentPrefix 
      ? normalizePath(`${parentPrefix}/${routeSegment}`)
      : normalizePath(route.path);

    const hasChildren = Boolean(route.children && route.children.length > 0);

    if (hasChildren) {
      const match = matchSegmentPattern(fullPattern, normalizedTarget, false);
      if (match) {
        const childBranch = matchRouteTree(route.children!, normalizedTarget, fullPattern);
        if (childBranch) {
          return [
            { route, pattern: fullPattern, params: match.params },
            ...childBranch
          ];
        }
      }
    } else {
      const match = matchSegmentPattern(fullPattern, normalizedTarget, true);
      if (match) {
        return [{ route, pattern: fullPattern, params: match.params }];
      }
    }
  }

  return null;
}

export function createRouter(routes: Route[]): Router {
  const initialHash = parseHashUrl(window.location.hash);

  const path = createSignal<string>(initialHash.path);
  const params = createSignal<Record<string, string>>({});
  const query = createSignal<Record<string, string | string[]>>(initialHash.query);
  const currentRoute = createSignal<RouteContext | null>(null);

  let activeMatchedBranch: MatchedBranchRecord[] = [];
  const beforeEachGuards: NavigationGuard[] = [];
  const afterEachHooks: NavigationHook[] = [];

  let navigationId = 0;
  let isRevertingHash = false;
  let activeEffectDisposer: (() => void) | null = null;

  function resolveLocation(to: string | LocationDescriptor): {
    fullPath: string;
    path: string;
    query: Record<string, string | string[]>;
    replace: boolean;
  } {
    if (typeof to === 'string') {
      const parsed = parseHashUrl(to);
      const qStr = stringifyQuery(parsed.query);
      return {
        fullPath: `${parsed.path}${qStr}`,
        path: parsed.path,
        query: parsed.query,
        replace: false
      };
    } else {
      const normPath = normalizePath(to.path);
      const q = to.query || {};
      const qStr = stringifyQuery(q);
      return {
        fullPath: `${normPath}${qStr}`,
        path: normPath,
        query: q,
        replace: Boolean(to.replace)
      };
    }
  }

  function updateBrowserHash(fullPath: string, replace: boolean): void {
    const targetHash = `#${fullPath}`;
    if (window.location.hash === targetHash) return;

    if (replace) {
      const url = window.location.href.split('#')[0] + targetHash;
      window.location.replace(url);
    } else {
      window.location.hash = targetHash;
    }
  }

  async function performNavigation(
    to: string | LocationDescriptor,
    fromHashChange: boolean = false
  ): Promise<boolean> {
    const currentNavId = ++navigationId;

    const target = resolveLocation(to);
    const branch = matchRouteTree(routes, target.path);

    if (!branch) {
      console.warn(`[Teloce Router] No route matched for path: ${target.path}`);
      return false;
    }

    const mergedParams: Record<string, string> = {};
    const mergedMeta: Record<string, any> = {};
    const matchedRoutes: Route[] = [];

    for (const record of branch) {
      Object.assign(mergedParams, record.params);
      if (record.route.meta) {
        Object.assign(mergedMeta, record.route.meta);
      }
      matchedRoutes.push(record.route);
    }

    const toContext: RouteContext = {
      path: target.path,
      fullPath: target.fullPath,
      params: mergedParams,
      query: target.query,
      meta: mergedMeta,
      matched: matchedRoutes
    };

    const fromContext = currentRoute();

    for (const guard of beforeEachGuards) {
      try {
        const result = await guard(toContext, fromContext);

        if (currentNavId !== navigationId) {
          return false;
        }

        if (result === false) {
          if (fromHashChange && fromContext) {
            isRevertingHash = true;
            updateBrowserHash(fromContext.fullPath, true);
            isRevertingHash = false;
          }
          return false;
        }

        if (typeof result === 'string') {
          return navigate(result);
        }
      } catch (err) {
        console.error('[Teloce Router] Error in beforeEach guard:', err);
        return false;
      }
    }

    activeMatchedBranch = branch;
    path.set(target.path);
    params.set(mergedParams);
    query.set(target.query);
    currentRoute.set(toContext);

    if (!fromHashChange) {
      updateBrowserHash(target.fullPath, target.replace);
    }

    for (const hook of afterEachHooks) {
      try {
        hook(toContext, fromContext);
      } catch (err) {
        console.error('[Teloce Router] Error in afterEach hook:', err);
      }
    }

    return true;
  }

  window.addEventListener('hashchange', () => {
    if (isRevertingHash) return;

    const { path: newPath, query: newQuery } = parseHashUrl(window.location.hash);
    const curr = currentRoute();

    if (curr && curr.path === newPath && JSON.stringify(curr.query) === JSON.stringify(newQuery)) {
      return;
    }

    performNavigation(window.location.hash.slice(1) || '/', true);
  });

  function navigate(to: string | LocationDescriptor): Promise<boolean> {
    return performNavigation(to, false);
  }

  function push(to: string | LocationDescriptor): Promise<boolean> {
    return navigate(to);
  }

  function replace(to: string | LocationDescriptor): Promise<boolean> {
    if (typeof to === 'string') {
      return performNavigation({ path: to, replace: true }, false);
    }
    return performNavigation({ ...to, replace: true }, false);
  }

  function back(): void {
    window.history.back();
  }

  function forward(): void {
    window.history.forward();
  }

  function go(delta: number): void {
    window.history.go(delta);
  }

  function beforeEach(guard: NavigationGuard): void {
    beforeEachGuards.push(guard);
  }

  function afterEach(hook: NavigationHook): void {
    afterEachHooks.push(hook);
  }

  function mount(container: Element, ctx: Record<string, any> = {}): () => void {
    if (activeEffectDisposer) {
      activeEffectDisposer();
      activeEffectDisposer = null;
    }

    activeEffectDisposer = wrapEffectAsDisposer(createEffect(() => {
      const route = currentRoute();
      container.innerHTML = '';

      if (route && activeMatchedBranch.length > 0) {
        const topMatch = activeMatchedBranch[0];
        // `ctx` (extra context the caller passed to mount()) was previously
        // accepted as a parameter and never used - only `route` reached
        // the rendered component, silently dropping anything the caller
        // wanted to pass down. `route`'s own fields win on conflict, since
        // those come from actual route matching and shouldn't be
        // shadowable by arbitrary caller data.
        topMatch.route.component.template(container, { ...ctx, ...route });
      } else {
        container.innerHTML = '<h1>404 - Page Not Found</h1>';
      }
    }));

    return () => {
      if (activeEffectDisposer) {
        activeEffectDisposer();
        activeEffectDisposer = null;
      }
    };
  }

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
    install(app: any) {
      if (app.component) {
        app.component('RouterView', createRouterView(router));
        app.component('RouterLink', createRouterLink(router));
      }

      if (app._context) {
        app._context.router = router;
      }

      if (app.provide) {
        app.provide('router', router);
        app.provide('route', currentRoute);
      }
    },
    getMatchedBranch: () => activeMatchedBranch,
    routes
  };

  performNavigation(window.location.hash.slice(1) || '/', true);

  return router;
}

export function createRouterView(router?: Router, depth: number = 0): {
  name: string;
  template: (container: Element, ctx?: any) => void;
} {
  return {
    name: 'RouterView',
    template: (container: Element, ctx?: any) => {
      const activeRouter: Router | undefined = router || ctx?.router || ctx?._context?.router;

      if (!activeRouter) {
        container.innerHTML = '<p>[Teloce Router] RouterView: Router instance not found.</p>';
        return;
      }

      createEffect(() => {
        const branch = activeRouter.getMatchedBranch();
        const routeCtx = activeRouter.currentRoute();
        container.innerHTML = '';

        if (branch && branch[depth] && routeCtx) {
          const matchRecord = branch[depth];
          matchRecord.route.component.template(container, routeCtx);
        }
      });
    }
  };
}

export function createRouterLink(routerOrProps?: Router | RouterLinkProps): {
  name: string;
  template: (container: Element, ctx?: any) => void;
} {
  return {
    name: 'RouterLink',
    template: (container: Element, ctx?: any) => {
      const activeRouter: Router | undefined = 
        'navigate' in (routerOrProps || {}) 
          ? (routerOrProps as Router) 
          : ctx?.router || ctx?._context?.router;

      if (!activeRouter) {
        container.innerHTML = '<a>[Teloce Router] Router missing</a>';
        return;
      }

      const props: RouterLinkProps = 'navigate' in (routerOrProps || {})
        ? ctx || {}
        : (routerOrProps as RouterLinkProps) || ctx || {};

      const a = document.createElement('a');

      if (props.label) {
        a.textContent = props.label;
      } else if (container.childNodes.length > 0) {
        while (container.firstChild) {
          a.appendChild(container.firstChild);
        }
      } else {
        a.textContent = 'Link';
      }

      const activeClass = props.activeClass || 'router-link-active';
      const exactActiveClass = props.exactActiveClass || 'router-link-exact-active';

      let targetPath = '';
      let targetQuery: Record<string, string | string[]> = {};

      if (typeof props.to === 'string') {
        const parsed = parseHashUrl(props.to);
        targetPath = parsed.path;
        targetQuery = parsed.query;
      } else if (props.to) {
        targetPath = normalizePath(props.to.path);
        targetQuery = props.to.query || {};
      }

      const fullHref = `#${targetPath}${stringifyQuery(targetQuery)}`;
      a.setAttribute('href', fullHref);

      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (props.to) {
          activeRouter.navigate(props.to);
        }
      });

      createEffect(() => {
        const currentPath = activeRouter.path();
        const isExact = currentPath === targetPath;
        const isActive = isExact || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`));

        a.classList.toggle(activeClass, isActive);
        a.classList.toggle(exactActiveClass, isExact);
      });

      container.innerHTML = '';
      container.appendChild(a);
    }
  };
}

export default {
  createRouter,
  createRouterView,
  createRouterLink,
};