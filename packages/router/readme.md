# @teloce/router




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

teloce: A JavaScript template engine for Python web developers.
* [Teloce Website](https://telonce-website.vercel.app/#/)


A small, dependency-light client-side router for Teloce single-page apps. Hash-based (no server rewrite rules needed), with nested routes, navigation guards, and reactive `RouterView`/`RouterLink` components.

## Install

```bash
npm install @teloce/router
```

`@teloce/reactivity` is a peer requirement — installing via npm pulls it in automatically as a dependency.

### Or via CDN

`@teloce/router` ships as a separate script from the main `teloce` bundle on purpose — most pages don't need a client router, and keeping it separate means you only pay for it when you use it, and it can update independently of core. Load `teloce.global.js` **first**; the router reads its reactivity primitives (`createSignal`/`createEffect`) off the `Teloce` global rather than bundling its own copy.

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@teloce/router@latest"></script>
<script>
  const { createRouter } = TeloceRouter;
  const router = createRouter([
    { path: '/', component: Home },
  ]);
</script>
```

If the scripts load in the wrong order, `createRouter()` throws a clear error telling you to load `teloce.global.js` first, rather than failing silently.

## Quick start

```js
import { createRouter } from '@teloce/router';

const Home = {
  template: (container, ctx) => {
    container.innerHTML = '<h1>Home</h1>';
  },
};

const UserProfile = {
  template: (container, ctx) => {
    container.innerHTML = `<h1>User ${ctx.params.id}</h1>`;
  },
};

const router = createRouter([
  { path: '/', component: Home },
  { path: '/users/:id', component: UserProfile },
]);

router.mount(document.getElementById('app'));
```

A route's `component` is anything with a `template(container, ctx)` function — this is the same shape `@teloce/sfc` compiles `.vel` files into, so a compiled component can be used directly as a route:

```js
import ProductPage from './pages/ProductPage.vel';

const router = createRouter([
  { path: '/products/:id', component: ProductPage },
]);
```

## Routing is hash-based

URLs look like `https://example.com/#/users/42`, not `https://example.com/users/42`. This is deliberate — it needs zero server configuration, which matters if the router is running inside a page a Python framework (Flask, FastAPI, Django) is already serving. If you need real paths without the `#`, that's not supported yet.

## Dynamic segments, optional segments, wildcards

```js
createRouter([
  { path: '/users/:id', component: UserProfile },       // :id -> ctx.params.id
  { path: '/posts/:slug?', component: PostList },         // :slug? -> optional
  { path: '/docs/*', component: DocsCatchAll },            // * -> ctx.params.pathMatch
]);
```

## Query strings

Query parameters are parsed automatically and reactive via `router.query`. Repeated keys (`?tag=a&tag=b`) become an array.

```js
// URL: #/search?q=widgets&tag=a&tag=b
ctx.query.q    // 'widgets'
ctx.query.tag  // ['a', 'b']
```

## Navigation

```js
router.navigate('/about');                          // go to a path
router.navigate({ path: '/about', query: { ref: 'nav' } });
router.push('/about');                               // alias for navigate
router.replace('/about');                             // replace current entry instead of pushing
router.back();
router.forward();
router.go(-2);
```

`navigate`/`push`/`replace` return a `Promise<boolean>` — `false` if a guard blocked the navigation or no route matched.

## Route params, query, and path as reactive signals

```js
import { createEffect } from '@teloce/reactivity';

createEffect(() => {
  console.log('current path:', router.path());
  console.log('params:', router.params());
});
```

## Navigation guards

```js
router.beforeEach((to, from) => {
  if (to.path === '/admin' && !isLoggedIn()) {
    return '/login';       // redirect
  }
  if (to.meta.blocked) {
    return false;           // cancel navigation
  }
  return true;               // allow
});

router.afterEach((to, from) => {
  document.title = to.meta.title || 'My App';
});
```

Guards can be `async` — navigation waits for them to resolve before committing.

## Nested routes

```js
const router = createRouter([
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: 'overview', component: Overview },        // -> /dashboard/overview
      { path: 'settings', component: Settings },          // -> /dashboard/settings
    ],
  },
]);
```

Params merge down the whole matched chain — a child route's `:id` is available in `ctx.params` even if the parent route also matched.

## RouterView and RouterLink

For rendering nested routes without manually wiring up child containers:

```js
import { createRouterView, createRouterLink } from '@teloce/router';

// top-level view
const rootView = createRouterView(router, 0);
rootView.template(document.getElementById('app'));

// nested view, one level deeper
const nestedView = createRouterView(router, 1);
nestedView.template(document.getElementById('dashboard-slot'));
```

```js
const link = createRouterLink(router);
link.template(linkContainer, {
  to: '/dashboard/settings',
  label: 'Settings',
  activeClass: 'is-active',
});
```

`RouterLink` intercepts clicks (no full page navigation), and reactively toggles `activeClass`/`exactActiveClass` as the current route changes.

## Route meta

```js
createRouter([
  { path: '/admin', component: Admin, meta: { requiresAuth: true, title: 'Admin' } },
]);

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return '/login';
});
```

## Cleaning up

`mount()` returns a disposer:

```js
const dispose = router.mount(container);
// later, e.g. when tearing down a test or a dynamically-created view:
dispose();
```

## API reference

### `createRouter(routes: Route[]): Router`

```ts
interface Route {
  path: string;
  component: { template: (container: Element, ctx: RouteContext) => void };
  children?: Route[];
  meta?: Record<string, any>;
}
```

Returns a `Router`:

| Property | Type | Description |
|---|---|---|
| `path` | `Signal<string>` | Current matched path |
| `params` | `Signal<Record<string, string>>` | Current route params, merged across the whole matched chain |
| `query` | `Signal<Record<string, string \| string[]>>` | Current query string, parsed |
| `currentRoute` | `Signal<RouteContext \| null>` | Full context of the current match |
| `navigate(to)` | `(to: string \| LocationDescriptor) => Promise<boolean>` | Navigate |
| `push(to)` | same as `navigate` | Alias |
| `replace(to)` | `(to) => Promise<boolean>` | Navigate, replacing history entry |
| `back()` / `forward()` / `go(delta)` | `() => void` | Browser history navigation |
| `mount(container, ctx?)` | `(container: Element, ctx?) => () => void` | Render the matched route into `container`; returns a disposer |
| `beforeEach(guard)` | `(guard: NavigationGuard) => void` | Register a navigation guard |
| `afterEach(hook)` | `(hook: NavigationHook) => void` | Register a post-navigation hook |
| `install(app)` | `(app) => void` | Registers `RouterView`/`RouterLink` as components if `app.component()` exists, and exposes the router via `app.provide()` if available |
| `getMatchedBranch()` | `() => MatchedBranchRecord[]` | The full matched route chain for the current path, root-first |
| `routes` | `Route[]` | The original routes array passed in |

### `RouteContext`

```ts
interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  path: string;
  fullPath: string;          // path + query string
  meta: Record<string, any>; // merged from every matched route in the chain
  matched: Route[];          // the matched route objects, root-first
}
```

### `createRouterView(router?, depth = 0)`

Returns a component rendering whatever route matched at the given nesting `depth` (0 = the outermost matched route). If `router` isn't passed directly, it looks for one on `ctx.router` or `ctx._context.router` at render time.

### `createRouterLink(routerOrProps?)`

Returns a component rendering an `<a>` that navigates on click without a full page load, and reactively applies `activeClass` (partial match) / `exactActiveClass` (exact match).

## What this router doesn't do (yet)

Being upfront about the current edges rather than letting you find out the hard way:

- No real (non-hash) URL support — everything lives after the `#`.
- No lazy-loaded routes (`component: () => import('./Page.vel')`) — every route's component needs to already be a resolved object when `createRouter()` is called.
- No scroll-position restoration on back/forward.
- No `props` mapping function for translating route params into a component's own prop names — `ctx.params` is passed through as-is.

## License

MIT