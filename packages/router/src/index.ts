import { createSignal, createEffect, type Signal } from '@teloce/reactivity';

export interface Route {
  path: string; // e.g. '/', '/about', '/users/:id'
  component: { template: (container: Element, ctx: any) => void };
}

export interface Router {
  path: Signal<string>;
  params: Signal<Record<string, string>>;
  navigate: (to: string) => void;
  mount: (container: Element, ctx?: Record<string, any>) => void;
}

/** Match a concrete URL path against a route pattern like '/users/:id'. */
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

/**
 * Create a small hash-based client router ('#/about', '#/users/42').
 * Hash-based avoids needing any server-side rewrite rules - if you'd
 * rather use real paths + the History API, swap the two `location.hash`
 * lines for `location.pathname` + a `popstate`/pushState pair; everything
 * else stays the same.
 */
export function createRouter(routes: Route[]): Router {
  const path = createSignal(location.hash.slice(1) || '/');
  const params = createSignal<Record<string, string>>({});

  window.addEventListener('hashchange', () => {
    path.set(location.hash.slice(1) || '/');
  });

  function navigate(to: string): void {
    location.hash = to;
  }

  function mount(container: Element, ctx: Record<string, any> = {}): void {
    createEffect(() => {
      const current = path();
      const match = routes.find(r => matchRoute(r.path, current) !== null);
      params.set(match ? matchRoute(match.path, current)! : {});

      container.innerHTML = '';
      if (match) {
        match.component.template(container, { ...ctx, params: params() });
      }
    });
  }

  return { path, params, navigate, mount };
}